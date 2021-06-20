FactoryBot.define do
  factory :fixed_event do
    title { "MyString" }
    starts_at { Faker::Time.between(from: 2.days.ago, to: Date.today) }
    ends_at { starts_at + ((1..3).to_a.sample).hours }
  end
end
