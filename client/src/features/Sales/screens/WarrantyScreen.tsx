import { TicketListScreen } from "./TicketListScreen";
import { AfterSalesTicketTypeValues } from "../../../lib/types/afterSales";

export function WarrantyScreen() {
  return (
    <TicketListScreen
      title="WARRANTY REQUESTS"
      description="Process and track warranty claims."
      ticketTypes={[AfterSalesTicketTypeValues.Warranty]}
      navPrefix="warranty"
    />
  );
}
