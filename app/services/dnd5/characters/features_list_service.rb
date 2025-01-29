# frozen_string_literal: true

module Dnd5
  module Characters
    class FeaturesListService
      FEATURES = [
        {
          slug: 'fighting_style',
          name: { en: '', ru: '' },
          description: { en: '', ru: '' },
          origin: 'class',
          origin_value: 'fighter',
          level: 1,
          options_type: 'static', # выбрать из списка
          options: %w[archery defense dueling great_weapon_fighting protection two_weapon_fighting]
        },
        {
          slug: 'draconic_ancestry',
          name: { en: '', ru: '' },
          description: { en: '', ru: '' },
          origin: 'race',
          origin_value: 'dragonborn',
          options_type: 'static',
          options: %w[black blue brass bronze copper gold green red silver white],
          limit: 1
        },
        {
          slug: 'expertise',
          name: { en: '', ru: '' },
          description: { en: '', ru: '' },
          origin: 'class',
          origin_value: 'bard',
          level: 3,
          options_type: 'choose_from', # выбрать из списка выбранных умений
          options: 'selected_skills'
        },
        {
          slug: 'land',
          name: { en: '', ru: '' },
          description: { en: '', ru: '' },
          origin: 'subclass',
          origin_value: 'circle_of_the_land',
          level: 3,
          options_type: 'static',
          options: %w[arctic coast desert forest grassland mountain swamp underdark],
          limit: 1
        }
      ].freeze

      # rubocop: disable Metrics/AbcSize
      def call(character:)
        FEATURES.select do |feature|
          case feature[:origin]
          when 'class'
            # уровень класса подходит
            character.data.classes[feature[:origin_value]].to_i >= feature[:level]
          when 'subclass'
            # взят подкласс
            class_name, _subclass_name = character.data.subclasses.find { |_, value| value == feature[:origin_value] }
            next false if class_name.nil?

            # и уровень класса подходит
            character.data.classes[class_name] >= feature[:level]
          when 'race'
            # раса подходит
            character.data.race == feature[:origin_value]
          else
            false
          end
        end
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
