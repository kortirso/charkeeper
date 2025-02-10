# frozen_string_literal: true

module Dnd5Character
  class ClassDecorateWrapper
    SPELL_SLOTS = {
      1 => { 1 => 2 },
      2 => { 1 => 3 },
      3 => { 1 => 4, 2 => 2 },
      4 => { 1 => 4, 2 => 3 },
      5 => { 1 => 4, 2 => 3, 3 => 2 },
      6 => { 1 => 4, 2 => 3, 3 => 3 },
      7 => { 1 => 4, 2 => 3, 3 => 3, 4 => 1 },
      8 => { 1 => 4, 2 => 3, 3 => 3, 4 => 2 },
      9 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 1 },
      10 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2 },
      11 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1 },
      12 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1 },
      13 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1, 7 => 1 },
      14 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1, 7 => 1 },
      15 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1, 7 => 1, 8 => 1 },
      16 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1, 7 => 1, 8 => 1 },
      17 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 2, 6 => 1, 7 => 1, 8 => 1, 9 => 1 },
      18 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 3, 6 => 1, 7 => 1, 8 => 1, 9 => 1 },
      19 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 3, 6 => 2, 7 => 1, 8 => 1, 9 => 1 },
      20 => { 1 => 4, 2 => 3, 3 => 3, 4 => 3, 5 => 3, 6 => 2, 7 => 2, 8 => 1, 9 => 1 }
    }.freeze

    def decorate_fresh_character(result:)
      class_decorator(result[:main_class]).decorate_fresh_character(result: result)
    end

    # rubocop: disable Metrics/AbcSize
    def decorate_character_abilities(result:)
      result[:classes].each do |class_name, class_level|
        result = class_decorator(class_name).decorate_character_abilities(result: result, class_level: class_level)
      end
      modify_saving_throws(result)

      # spell slots for multiclass
      if result[:spell_classes].keys.size > 1
        multiclass_spell_class =
          result[:classes].slice('bard', 'wizard', 'druid', 'cleric', 'sorcerer').values.sum + # full level
            result[:classes].slice('paladin', 'ranger').values.sum { |item| item / 2 } + # half round down
            result[:classes].slice('artificer').values.sum { |item| (item / 2.0).round } # half round up

        result[:spells_slots] = SPELL_SLOTS[multiclass_spell_class]
      end

      result
    end
    # rubocop: enable Metrics/AbcSize

    private

    def modify_saving_throws(result)
      result[:class_save_dc].each do |class_saving_throw|
        result[:save_dc][class_saving_throw] += result[:proficiency_bonus]
      end
    end

    def class_decorator(main_class)
      Charkeeper::Container.resolve("decorators.dnd5_character.classes.#{main_class}")
    end
  end
end
