# frozen_string_literal: true

module CharactersContext
  class Dnd5RulePresenter
    extend Dry::Initializer

    option :character

    CLASS_SAVING_THROWS = {
      'barbarian' => %i[str con],
      'bard' => %i[dex cha],
      'cleric' => %i[wis cha],
      'druid' => %i[int wis],
      'fighter' => %i[str con],
      'monk' => %i[str dex],
      'paladin' => %i[wis cha],
      'ranger' => %i[str dex],
      'rogue' => %i[dex int],
      'sorcerer' => %i[con cha],
      'wizard' => %i[int wis],
      'warlock' => %i[wis cha],
      'artificer' => %i[con int]
    }.freeze

    def present
      {
        overall_level: overall_level,
        proficiency_bonus: proficiency_bonus,
        abilities: abilities,
        saving_throws: saving_throws,
        class_saving_throws: class_saving_throws
      }
    end

    private

    def overall_level
      @overall_level ||= character.data['classes'].values.sum
    end

    def proficiency_bonus
      @proficiency_bonus ||= 2 + ((overall_level - 1) / 4)
    end

    # rubocop: disable Metrics/AbcSize
    def abilities
      return @abilities if defined?(@abilities)

      values = character.data['abilities']
      @abilities =
        {
          str: { value: values['str'], modifier: modifier(values['str']) },
          dex: { value: values['dex'], modifier: modifier(values['dex']) },
          con: { value: values['con'], modifier: modifier(values['con']) },
          int: { value: values['int'], modifier: modifier(values['int']) },
          wis: { value: values['wis'], modifier: modifier(values['wis']) },
          cha: { value: values['cha'], modifier: modifier(values['cha']) }
        }
    end

    def saving_throws
      {
        str: abilities.dig(:str, :modifier) + (class_saving_throws.include?(:str) ? proficiency_bonus : 0),
        dex: abilities.dig(:dex, :modifier) + (class_saving_throws.include?(:dex) ? proficiency_bonus : 0),
        con: abilities.dig(:con, :modifier) + (class_saving_throws.include?(:con) ? proficiency_bonus : 0),
        int: abilities.dig(:int, :modifier) + (class_saving_throws.include?(:int) ? proficiency_bonus : 0),
        wis: abilities.dig(:wis, :modifier) + (class_saving_throws.include?(:wis) ? proficiency_bonus : 0),
        cha: abilities.dig(:cha, :modifier) + (class_saving_throws.include?(:cha) ? proficiency_bonus : 0)
      }
    end
    # rubocop: enable Metrics/AbcSize

    def class_saving_throws
      @class_saving_throws ||= CLASS_SAVING_THROWS[first_class]
    end

    def first_class
      character.data['classes'].keys.first
    end

    def modifier(value)
      (value / 2) - 5
    end
  end
end
