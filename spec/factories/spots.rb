# frozen_string_literal: true

FactoryBot.define do
  factory :spot do
    sequence(:name) { |n| "Platz #{n}" }
    fields { build_list(:field, 3) }
  end
end
