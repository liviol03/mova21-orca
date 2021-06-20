class FixedEvent < ApplicationRecord
  extend Mobility
  validates_with StartBeforeEndValidator
  validates_presence_of :starts_at, :ends_at

  translates :title, type: :string, locale_accessors: true, fallbacks: true
end
