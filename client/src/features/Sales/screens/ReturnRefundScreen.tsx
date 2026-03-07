import { TicketListScreen } from "./TicketListScreen";
import { AfterSalesTicketTypeValues } from "../../../lib/types/afterSales";

export function ReturnRefundScreen() {
  return (
    <TicketListScreen
      title="RETURN / REFUND REQUESTS"
      description="Manage and process return and refund requests."
      ticketTypes={[AfterSalesTicketTypeValues.Return, AfterSalesTicketTypeValues.Refund]}
      navPrefix="return-refund"
    />
  );
}
