# frozen_string_literal: true

module Dnd5
  class ClassDecorator
    extend Dry::Initializer

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

    option :decorator

    # rubocop: disable Metrics/AbcSize
    def decorate
      result = decorator.decorate

      # дополнить result
      result[:classes].each do |class_name, class_level|
        result = class_decorator(class_name).decorate(result: result, class_level: class_level)
      end
      modify_saving_throws(result)
      if result[:spell_classes].keys.size > 1
        multiclass_spell_class =
          result[:classes].slice('bard', 'wizard', 'druid', 'cleric', 'sorcerer').values.sum +
            result[:classes].slice('paladin', 'ranger').values.sum { |item| item / 2 }

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

    def class_decorator(class_name)
      case class_name
      when 'barbarian' then Dnd5::Classes::BarbarianDecorator.new
      when 'fighter' then Dnd5::Classes::FighterDecorator.new
      when 'monk' then Dnd5::Classes::MonkDecorator.new
      when 'sorcerer' then Dnd5::Classes::SorcererDecorator.new
      when 'druid' then Dnd5::Classes::DruidDecorator.new
      when 'wizard' then Dnd5::Classes::WizardDecorator.new
      else Dnd5::Classes::DummyDecorator.new
      end
    end
  end
end
