# frozen_string_literal: true

module Dnd5
  module Characters
    class FeaturesListService
      # rubocop: disable Layout/LineLength
      FEATURES = [
        {
          slug: 'metamagic',
          name: { en: 'Metamagic', ru: 'Метамагия' },
          description: {
            en: 'You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level. You can use only one Metamagic option on a spell when you cast it, unless otherwise noted.',
            ru: 'Вы выбираете два варианта метамагии из перечисленных ниже. На 10 и 17 уровне вы получаете ещё по одному варианту. При сотворении заклинания может быть использован только один метамагический вариант, если в его описании не указано обратное.'
          },
          origin: 'class',
          origin_value: 'sorcerer',
          level: 3,
          options_type: 'static', # выбрать из списка
          options: %w[
            careful_spell distant_spell empowered_spell extended_spell
            heightened_spell quickened_spell subtle_spell twinned_spell
          ]
        },
        # {
        #   slug: 'fighting_style',
        #   name: { en: '', ru: '' },
        #   description: { en: '', ru: '' },
        #   origin: 'class',
        #   origin_value: 'fighter',
        #   level: 1,
        #   options_type: 'static', # выбрать из списка
        #   options: %w[archery defense dueling great_weapon_fighting protection two_weapon_fighting]
        # },
        {
          slug: 'draconic_ancestry',
          name: { en: 'Dragon Ancestor', ru: 'Драконий предок' },
          description: {
            en: 'You choose one type of dragon as your ancestor.',
            ru: 'Вы выбираете вид вашего дракона-предка.'
          },
          origin: 'subclass',
          origin_value: 'draconic_bloodline',
          level: 1,
          options_type: 'static',
          options: %w[black blue brass bronze copper gold green red silver white],
          limit: 1
        },
        # {
        #   slug: 'expertise',
        #   name: { en: '', ru: '' },
        #   description: { en: '', ru: '' },
        #   origin: 'class',
        #   origin_value: 'bard',
        #   level: 3,
        #   options_type: 'choose_from', # выбрать из списка выбранных умений
        #   options: 'selected_skills'
        # },
        {
          slug: 'land',
          name: { en: 'Circle spells', ru: 'Заклинания круга' },
          description: {
            en: 'Your mystical connection to the land infuses you with the ability to cast certain spells.',
            ru: 'Духовная связь друида с землёй наделяет его некоторыми заклинаниями.'
          },
          origin: 'subclass',
          origin_value: 'circle_of_the_land',
          level: 3,
          options_type: 'static',
          options: %w[arctic coast desert forest grassland mountain swamp underdark],
          limit: 1
        }
      ].freeze
      # rubocop: enable Layout/LineLength

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
