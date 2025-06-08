# frozen_string_literal: true

FactoryBot.define do
  factory :daggerheart_character_feature, class: 'Daggerheart::Character::Feature' do
    trait :rally do
      slug { 'rally' }
      title { { en: 'Rally', ru: 'Rally' } }
      # rubocop: disable Layout/LineLength
      description {
        {
          en: 'Describe how you rally the party and give yourself and each of your allies a Rally Die {{value}}. A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice.',
          ru: 'Describe how you rally the party and give yourself and each of your allies a Rally Die {{value}}. A PC can spend their Rally Die to roll it, adding the result to their action roll, reaction roll, damage roll, or to clear a number of Stress equal to the result. At the end of each session, clear all unspent Rally Dice.'
        }
      }
      # rubocop: enable Layout/LineLength
      origin { 'class' }
      origin_value { 'bard' }
      kind { 'static' }
      visible { 'true' }
      description_eval_variables {
        {
          value: "level >= 5 ? 'd8' : 'd6'",
          limit: '1'
        }
      }
      limit_refresh { 'session' }
    end
  end
end
