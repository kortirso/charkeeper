# frozen_string_literal: true

module Dnd2024Character
  class ClassDecorateWrapper < ApplicationDecorateWrapper
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

    EMPTY_SPELL_SLOTS = {
      1 => { 1 => 0 },
      2 => { 1 => 0 },
      3 => { 1 => 0 },
      4 => { 1 => 0 },
      5 => { 1 => 0 },
      6 => { 1 => 0 },
      7 => { 1 => 0 },
      8 => { 1 => 0 },
      9 => { 1 => 0 },
      10 => { 1 => 0 },
      11 => { 1 => 0 },
      12 => { 1 => 0 },
      13 => { 1 => 0 },
      14 => { 1 => 0 },
      15 => { 1 => 0 },
      16 => { 1 => 0 },
      17 => { 1 => 0 },
      18 => { 1 => 0 },
      19 => { 1 => 0 },
      20 => { 1 => 0 }
    }.freeze

    def spells_slots
      @spells_slots ||=
        if spell_classes.keys.size > 1
          SPELL_SLOTS[spell_classes.values.pluck(:multiclass_spell_level).compact.sum]
        else
          wrapped.spells_slots
        end
    end

    private

    def wrap_classes(obj)
      obj.classes.keys.inject(obj) do |acc, class_name|
        acc = class_decorator(class_name).new(acc)
        acc
      end
    end

    def class_decorator(class_name)
      "Dnd2024Character::Classes::#{class_name.camelize}Decorator".constantize
    end
  end
end
