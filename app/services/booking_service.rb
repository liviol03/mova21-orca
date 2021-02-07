class BookingService
  def initialize(unit)
    @unit = unit
  end

  def self.rules 
    @rules ||= {}
  end

  class Rule 
    def
