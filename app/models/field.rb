class Field < ApplicationRecord
  belongs_to :spot
  has_many :activity_executions
end
