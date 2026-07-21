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
};

export function LeadNotification(data: LeadNotificationData) {
  // D-03: product identity is the query-param slug; fall back to the raw
  // slug in the heading when the display name wasn't supplied.
  const productLabel = data.productName ?? data.product;
  const contactLine = [data.email, data.phone].filter(Boolean).join(" · ");

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
          {data.product && (
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
