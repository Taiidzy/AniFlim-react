import React, { useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const YearRangeSlider = ({
  sliderConfig = {},
  setFilters,
  yearsList,
  filters
}) => {

  if (!yearsList || yearsList.length === 0) {
    return <p>Загрузка слайдера...</p>;
  }

  // Значения по умолчанию для слайдера
  const defaultSliderProps = {
    range: true,
    min: yearsList[0],
    max: yearsList[yearsList.length - 1],
    defaultValue: [filters.fromYear, filters.toYear],
    onChange: (value) =>
      setFilters((prev) => ({ ...prev, fromYear: value[0], toYear: value[1] })),
    trackStyle: [{ backgroundColor: "pink" }],
    handleStyle: [{ backgroundColor: "blue" }, { backgroundColor: "blue" }],
    railStyle: { backgroundColor: "grey" },
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Период выхода: {filters.fromYear} - {filters.toYear}
      </label>
      <Slider {...defaultSliderProps} {...sliderConfig} />
    </div>
  );
};

export default YearRangeSlider;
