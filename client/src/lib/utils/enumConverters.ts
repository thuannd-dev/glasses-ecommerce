import type {
  AfterSalesTicketStatus,
  AfterSalesTicketType,
  TicketResolutionType,
} from "../types/afterSales";
import {
  AfterSalesTicketStatusValues,
  AfterSalesTicketTypeValues,
  TicketResolutionTypeValues,
} from "../types/afterSales";
import type { TicketListDto, TicketDetailDto, StaffAfterSalesResponse } from "../types/afterSales";

/**
 * Converts string enum values from API (due to JsonStringEnumConverter on backend)
 * to numeric enum values expected by TypeScript types
 */

function convertTicketStatusStringToNumber(status: string | number): AfterSalesTicketStatus {
  if (typeof status === "number") return status as AfterSalesTicketStatus;

  switch (status) {
    case "Pending":
      return AfterSalesTicketStatusValues.Pending;
    case "InProgress":
      return AfterSalesTicketStatusValues.InProgress;
    case "Replacing":
      return AfterSalesTicketStatusValues.Replacing;
    case "Resolved":
      return AfterSalesTicketStatusValues.Resolved;
    case "Rejected":
      return AfterSalesTicketStatusValues.Rejected;
    case "Closed":
      return AfterSalesTicketStatusValues.Closed;
    case "Cancelled":
      return AfterSalesTicketStatusValues.Cancelled;
    default:
      return AfterSalesTicketStatusValues.Pending;
  }
}

function convertTicketTypeStringToNumber(type: string | number): AfterSalesTicketType {
  if (typeof type === "number") return type as AfterSalesTicketType;

  switch (type) {
    case "Return":
      return AfterSalesTicketTypeValues.Return;
    case "Warranty":
      return AfterSalesTicketTypeValues.Warranty;
    case "Refund":
      return AfterSalesTicketTypeValues.Refund;
    case "Unknown":
      return AfterSalesTicketTypeValues.Unknown;
    default:
      return AfterSalesTicketTypeValues.Unknown;
  }
}

function convertResolutionTypeStringToNumber(type: string | number | null | undefined): TicketResolutionType | null {
  if (!type) return null;
  if (typeof type === "number") return type as TicketResolutionType;

  switch (type) {
    case "RefundOnly":
      return TicketResolutionTypeValues.RefundOnly;
    case "ReturnAndRefund":
      return TicketResolutionTypeValues.ReturnAndRefund;
    case "WarrantyRepair":
      return TicketResolutionTypeValues.WarrantyRepair;
    case "WarrantyReplace":
      return TicketResolutionTypeValues.WarrantyReplace;
    default:
      return null;
  }
}

export function normalizeTicketListDto(dto: TicketListDto): TicketListDto {
  return {
    ...dto,
    ticketStatus: convertTicketStatusStringToNumber(dto.ticketStatus),
    ticketType: convertTicketTypeStringToNumber(dto.ticketType),
    resolutionType: convertResolutionTypeStringToNumber(dto.resolutionType),
  };
}

export function normalizeTicketDetailDto(dto: TicketDetailDto): TicketDetailDto {
  return {
    ...dto,
    ticketStatus: convertTicketStatusStringToNumber(dto.ticketStatus),
    ticketType: convertTicketTypeStringToNumber(dto.ticketType),
    resolutionType: convertResolutionTypeStringToNumber(dto.resolutionType),
  };
}

export function normalizeStaffAfterSalesResponse(response: StaffAfterSalesResponse): StaffAfterSalesResponse {
  return {
    ...response,
    items: response.items.map(normalizeTicketListDto),
  };
}
