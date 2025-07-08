# frozen_string_literal: true

FactoryBot.define do
  factory :feat do
    trait :rally do
      type { 'Daggerheart::Feat' }
      sequence(:slug) { |i| "rally-#{i}" }
      title {
        { en: 'Rally', ru: 'Rally' }
      }
      # rubocop: disable Layout/LineLength
      description {
        {
          en: 'Describe how you rally the party and give yourself and each of your allies a Rally Die {{value}}. A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice.',
          ru: 'Describe how you rally the party and give yourself and each of your allies a Rally Die {{value}}. A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice.'
        }
      }
      origin { 2 }
      origin_value { 'bard' }
      kind { 0 }
      conditions {
        {
          level: 1
        }
      }
      description_eval_variables {
        {
          value: "level >= 5 ? 'd8' : 'd6'",
          limit: '1'
        }
      }
      limit_refresh { 'session' }
      # rubocop: enable Layout/LineLength
    end
  end
end
