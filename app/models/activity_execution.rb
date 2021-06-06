class ActivityExecution < ApplicationRecord
  include Bitfields

  belongs_to :activity, inverse_of: :activity_executions
  belongs_to :field, inverse_of: :activity_executions
  has_one :spot, through: :field

  bitfield :language_flags, *Activity::LANGUAGES

  def languages
    bitfield_values(:language_flags)
  end
end
