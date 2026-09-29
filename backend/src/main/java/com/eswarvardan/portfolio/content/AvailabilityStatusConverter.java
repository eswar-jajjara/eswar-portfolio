package com.eswarvardan.portfolio.content;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class AvailabilityStatusConverter implements AttributeConverter<AvailabilityStatus, String> {
  @Override
  public String convertToDatabaseColumn(AvailabilityStatus attribute) {
    return attribute == null ? null : attribute.getValue();
  }

  @Override
  public AvailabilityStatus convertToEntityAttribute(String databaseValue) {
    return databaseValue == null ? null : AvailabilityStatus.fromValue(databaseValue);
  }
}
