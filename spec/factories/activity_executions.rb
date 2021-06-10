FactoryBot.define do
  factory :activity_execution do
    activity
    starts_at { Faker::Date.between(from: 2.days.ago, to: Date.today) }
    add_attribute(:field) { create(:field) }
    ends_at { starts_at + ((1..5).to_a.sample).hours }
  end
end
