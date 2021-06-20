class ActivityExecution < ApplicationRecord
  include Bitfields
  validates_with StartBeforeEndValidator

  belongs_to :activity, inverse_of: :activity_executions
  belongs_to :field, inverse_of: :activity_executions
  has_one :spot, through: :field
  validates_presence_of :starts_at, :ends_at, :transport
  validates :language_flags, numericality: { greater_than: 0 }, allow_nil: false

  bitfield :language_flags, *Activity::LANGUAGES

  def languages
    bitfield_values(:language_flags)
  end
end
