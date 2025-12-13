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

    trait :dnd5 do
      type { 'Dnd5::Feat' }
      limit_refresh { 'long_rest' }
    end

    trait :daggerheart do
      type { 'Daggerheart::Feat' }
      limit_refresh { 'long_rest' }
    end

    trait :dnd5_bardic_inspiration do
      type { 'Dnd5::Feat' }
      slug { 'bardic_inspiration' }
      title {
        {
          en: 'Bardic inspiration',
          ru: 'Вдохновение барда'
        }
      }
      # rubocop: disable Layout/LineLength
      description {
        {
          en: 'You can use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic inspiration die, a {{value}}. Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes.',
          ru: 'Вы можете бонусным действием выбрать одно существо, отличное от вас, в пределах 60 футов, которое может вас слышать. Это существо получает кость бардовского вдохновения — {{value}}. В течение следующих 10 минут это существо может один раз бросить эту кость и добавить результат к проверке характеристики, броску атаки или спасброску, который оно совершает.'
        }
      }
      origin { 2 }
      origin_value { 'bard' }
      kind { 0 }
      description_eval_variables {
        {
          value: "class_level = classes['bard']; return 'd12' if class_level >= 15; return 'd10' if class_level >= 10; return 'd8' if class_level >= 5; 'd6'",
          limit: "[1, modifiers['wis']].max"
        }
      }
      limit_refresh { 'long_rest' }
      # rubocop: enable Layout/LineLength
    end

    trait :dnd2024_bardic_inspiration do
      type { 'Dnd2024::Feat' }
      slug { 'bardic_inspiration' }
      title {
        {
          en: 'Bardic inspiration',
          ru: 'Вдохновение барда'
        }
      }
      # rubocop: disable Layout/LineLength
      description {
        {
          en: 'You can use a bonus action on your turn to choose one creature other than yourself within 60 feet of you who can hear you. That creature gains one Bardic inspiration die, a {{value}}. Once within the next 10 minutes, the creature can roll the die and add the number rolled to one ability check, attack roll, or saving throw it makes.',
          ru: 'Вы можете бонусным действием выбрать одно существо, отличное от вас, в пределах 60 футов, которое может вас слышать. Это существо получает кость бардовского вдохновения — {{value}}. В течение следующих 10 минут это существо может один раз бросить эту кость и добавить результат к проверке характеристики, броску атаки или спасброску, который оно совершает.'
        }
      }
      origin { 2 }
      origin_value { 'bard' }
      kind { 0 }
      description_eval_variables {
        {
          value: "class_level = classes['bard']; return 'd12' if class_level >= 15; return 'd10' if class_level >= 10; return 'd8' if class_level >= 5; 'd6'",
          limit: "[1, modifiers['wis']].max"
        }
      }
      limit_refresh { 'long_rest' }
      # rubocop: enable Layout/LineLength
    end
  end
end
