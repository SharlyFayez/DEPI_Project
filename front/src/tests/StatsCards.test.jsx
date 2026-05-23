import { render, screen } from "@testing-library/react";
import StatsCards from "../components/StatsCards";

describe("StatsCards", () => {

  test("renders stats correctly", () => {

    render(
      <StatsCards
        stats={{
          totalRecords: 100,
          highCongestion: 10,
          mediumCongestion: 20,
          averageVehicleCount: 55,
          averageSpeed: 35,
          activeIncidents: 2,
        }}
      />
    );

    expect(
      screen.getByText("Total Traffic Records")
    ).toBeTruthy();

    expect(
      screen.getByText("100")
    ).toBeTruthy();

  });

});