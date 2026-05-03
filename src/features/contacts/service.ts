import type { Contact, ContactFormData } from "@shared/types/domainTypes";
import { InternalServerError, NotFoundError } from "@shared/errors/AppError";
import { pickServiceImplementation } from "@shared/services/pickServiceImplementation";
import { err, ok, type Result } from "@shared/types/Result";
import { getInitials } from "@shared/utils/text";
import { MOCK_INITIAL_CONTACTS } from "./data/mock-contacts";

export interface ContactsService {
  list(): Promise<Result<Contact[]>>;
  create(_data: ContactFormData): Promise<Result<Contact>>;
  update(_id: number, _data: Partial<ContactFormData>): Promise<Result<Contact>>;
  remove(_id: number): Promise<Result<void>>;
}

let contactsState = [...MOCK_INITIAL_CONTACTS];

const contactsServiceMock: ContactsService = {
  async list() {
    return ok([...contactsState]);
  },
  async create(data: ContactFormData) {
    const next: Contact = {
      id: Math.max(0, ...contactsState.map((c) => c.id)) + 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      segment: data.segment,
      city: data.city,
      notes: data.notes,
      avatar: getInitials(data.name),
      color: "from-gray-400 to-gray-600",
      orders: 0,
      totalSpent: 0,
      lastOrder: "",
    };
    contactsState = [...contactsState, next];
    return ok(next);
  },
  async update(id: number, data: Partial<ContactFormData>) {
    const idx = contactsState.findIndex((c) => c.id === id);
    if (idx === -1) return err(new NotFoundError("Contact"));
    const prev = contactsState[idx];
    const merged = { ...prev, ...data } as Contact;
    contactsState = contactsState.map((c) => (c.id === id ? merged : c));
    return ok(merged);
  },
  async remove(id: number) {
    const before = contactsState.length;
    contactsState = contactsState.filter((c) => c.id !== id);
    if (contactsState.length === before) return err(new NotFoundError("Contact"));
    return ok(undefined);
  },
};

const contactsServiceSupabase: ContactsService = {
  async list() {
    return err(new InternalServerError());
  },
  async create() {
    return err(new InternalServerError());
  },
  async update() {
    return err(new InternalServerError());
  },
  async remove() {
    return err(new InternalServerError());
  },
};

export const contactsService = pickServiceImplementation(
  contactsServiceSupabase,
  contactsServiceMock,
);
