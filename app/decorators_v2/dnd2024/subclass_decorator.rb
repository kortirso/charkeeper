# frozen_string_literal: true

module Dnd2024
  class SubclassDecorator < ApplicationDecoratorV2
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

    def call(result:)
      subclass_keys = result['subclasses'].values.compact
      subclass_keys.each { |subclass_name| result = subclass_decorator(subclass_name, result) }

      result['spells_slots'] = select_spells_slots(result)
      result['available_spell_level'] = result['spells_slots'].keys.max
      result
    end

    private

    def select_spells_slots(result)
      if result['spell_classes'].values.many? { |value| value[:save_dc].present? }
        multiclass_level = [result['spell_classes'].values.pluck(:multiclass_spell_level).compact.sum, 20].min
        SPELL_SLOTS[multiclass_level]
      else
        result['spells_slots']
      end
    end

    def subclass_decorator(subclass_name, result)
      "Dnd2024::Subclasses::#{subclass_name.camelize}Decorator".constantize.new.call(result: result)
    rescue NameError => _e
      result
    end
  end
end
