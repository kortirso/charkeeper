# frozen_string_literal: true

FactoryBot.define do
  factory :dnd2024_character_feature, class: 'Dnd2024::Character::Feature' do
    trait :bardic_inspiration do
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
      origin { Dnd5::Character::Feature::CLASS_ORIGIN }
      origin_value { 'bard' }
      level { 1 }
      kind { Dnd5::Character::Feature::STATIC }
      visible { 'true' }
      eval_variables {
        {
          value: "class_level = result.dig(:classes, 'bard'); return 'd12' if class_level >= 15; return 'd10' if class_level >= 10; return 'd8' if class_level >= 5; 'd6'",
          limit: '[1, result.dig(:modifiers, :wis)].max'
        }
      }
      limit_refresh { 'long_rest' }
      # rubocop: enable Layout/LineLength
    end
  end
end
