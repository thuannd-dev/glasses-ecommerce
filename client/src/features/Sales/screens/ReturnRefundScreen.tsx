import { TicketListScreen } from "./TicketListScreen";
import { AfterSalesTicketTypeValues } from "../../../lib/types/afterSales";

export function ReturnRefundScreen() {
  return (
    <TicketListScreen
      title="Return / Refund Requests"
      ticketTypes={[AfterSalesTicketTypeValues.Return, AfterSalesTicketTypeValues.Refund]}
      navPrefix="return-refund"
    />
  );
}
