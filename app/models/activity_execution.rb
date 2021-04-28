class ActivityExecution < ApplicationRecord
  belongs_to :activity, inverse_of: :activity_executions
end
