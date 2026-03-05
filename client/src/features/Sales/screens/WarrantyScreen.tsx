import { TicketListScreen } from "./TicketListScreen";
import { AfterSalesTicketTypeValues } from "../../../lib/types/afterSales";

export function WarrantyScreen() {
  return (
    <TicketListScreen
      title="Warranty Requests"
      ticketTypes={[AfterSalesTicketTypeValues.Warranty]}
      navPrefix="warranty"
    />
  );
}
