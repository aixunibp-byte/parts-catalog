"""
SQLAlchemy-модели каталога автозапчастей.
"""
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, BigInteger, String, Numeric, Boolean,
    DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


def utcnow():
    return datetime.now(timezone.utc)


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True)
    ozon_product_id = Column(BigInteger, unique=True, nullable=False, index=True)
    ozon_sku = Column(BigInteger, index=True, nullable=True)
    offer_id = Column(String(255), unique=True, nullable=False, index=True)

    name = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    brand = Column(String(255), nullable=True, index=True)
    barcode = Column(String(64), nullable=True)

    category_id = Column(BigInteger, nullable=True)
    category_name = Column(String(255), nullable=True)

    price = Column(Numeric(12, 2), nullable=True)
    old_price = Column(Numeric(12, 2), nullable=True)
    currency_code = Column(String(8), default="RUB")

    weight = Column(Integer, nullable=True)
    weight_unit = Column(String(8), nullable=True)
    depth = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    dimension_unit = Column(String(8), nullable=True)

    moderate_status = Column(String(32), nullable=True)
    is_archived = Column(Boolean, default=False)
    has_stock = Column(Boolean, default=False)

    primary_image = Column(String(1000), nullable=True)

    manual_override = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    last_edited_at = Column(DateTime(timezone=True), nullable=True)

    images = relationship("PartImage", back_populates="part", cascade="all, delete-orphan")
    attributes = relationship("PartAttribute", back_populates="part", cascade="all, delete-orphan")
    stocks = relationship("PartStock", back_populates="part", cascade="all, delete-orphan")


class PartImage(Base):
    __tablename__ = "part_images"

    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(1000), nullable=False)
    sort_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)

    part = relationship("Part", back_populates="images")


class PartAttribute(Base):
    __tablename__ = "part_attributes"

    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    ozon_attribute_id = Column(BigInteger, nullable=False)
    name = Column(String(500), nullable=True)
    value = Column(Text, nullable=True)
    dictionary_value_id = Column(BigInteger, nullable=True)

    part = relationship("Part", back_populates="attributes")


class PartStock(Base):
    __tablename__ = "part_stocks"

    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    warehouse_name = Column(String(255), nullable=True)
    present = Column(Integer, default=0)
    reserved = Column(Integer, default=0)
    stock_type = Column(String(32), nullable=True)

    part = relationship("Part", back_populates="stocks")


class SyncLog(Base):
    __tablename__ = "sync_log"

    id = Column(Integer, primary_key=True)
    started_at = Column(DateTime(timezone=True), default=utcnow)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(32), default="running")
    products_processed = Column(Integer, default=0)
    products_failed = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_log"

    id = Column(Integer, primary_key=True)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(64), nullable=False)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
