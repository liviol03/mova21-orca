# frozen_string_literal: true

# == Schema Information
#
# Table name: goals
#
#  id         :bigint           not null, primary key
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
class Goal < ApplicationRecord
  extend Mobility

  has_and_belongs_to_many :activities

  validates :name, presence: true
  translates :name, type: :string, locale_accessors: true, fallbacks: true
end
