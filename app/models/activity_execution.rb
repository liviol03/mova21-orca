class ActivityExecution < ApplicationRecord
  include Bitfields

  belongs_to :activity, inverse_of: :activity_executions

  bitfield :language_flags, *Activity::LANGUAGES

  def languages
    bitfield_values(:language_flags)
  end
end
