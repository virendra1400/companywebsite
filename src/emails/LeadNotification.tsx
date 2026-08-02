// Sales-inbox notification email for a submitted inquiry/RFQ (LEAD-04).
// Uses the single current `react-email` package — the older per-component
// package it replaced is deprecated and removed from the registry
// (Pitfall 1). Renders as labelled rows, mirroring ContactBlockView's
// labelled-row shape.
import { Body, Container, Head, Heading, Html, Text } from "react-email";

export type LeadNotificationData = {
  name: string;
  company: string;
  country: string;
  message: string;
  email?: string;
  phone?: string;
  product?: string;
  productName?: string;
  quantity?: string;
  destinationCountry?: string;
  incoterm?: string;
  // T-109/C-18
  buyerType?: string;
  productsInterested?: string[];
  timeline?: string;
};

export function LeadNotification(data: LeadNotificationData) {
  // D-03: product identity is the query-param slug; fall back to the raw
  // slug in the heading when the display name wasn't supplied.
  const productLabel = data.productName ?? data.product;
  const contactLine = [data.email, data.phone].filter(Boolean).join(" · ");
  const hasRfqDetails = Boolean(
    data.product || data.quantity || data.destinationCountry || data.incoterm,
  );

  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>{data.product ? `New RFQ: ${productLabel}` : "New inquiry"}</Heading>
          <Text>
            From: {data.name} ({data.company}, {data.country})
          </Text>
          {contactLine && <Text>Contact: {contactLine}</Text>}
          {data.buyerType && <Text>Buyer type: {data.buyerType}</Text>}
          {data.productsInterested && data.productsInterested.length > 0 && (
            <Text>Products of interest: {data.productsInterested.join(", ")}</Text>
          )}
          {data.timeline && <Text>Timeline: {data.timeline}</Text>}
          {hasRfqDetails && (
            <Text>
              Quantity: {data.quantity ?? "—"} · Destination: {data.destinationCountry ?? "—"} ·
              Incoterm: {data.incoterm ?? "—"}
            </Text>
          )}
          <Text>{data.message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
