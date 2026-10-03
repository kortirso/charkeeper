# frozen_string_literal: true

module Dnd2024
  module Classes
    class CustomDecorator
      def method_missing(method, *_args)
        @result[method.to_s]
      end

      def initialize(class_name:)
        @class_name = class_name
        @class_info = ::Dnd2024::Homebrews::Speciality.find_by(id: class_name)&.info
      end

      def call(result:)
        @result = result
        @result['class_save_dc'] = @class_info.class_saves if main_class == @class_name
        @result['spell_classes'][@class_name] =
          @class_info.multiclass_spell_level.positive? ? spell_class_info : { multiclass_spell_level: 0 }
        @result['spells_slots'] = @class_info.multiclass_spell_level.positive? ? spells_slots : { 1 => 0 }
        @result
      end

      private

      def spell_class_info # rubocop: disable Metrics/AbcSize
        {
          save_dc: 8 + proficiency_bonus + modifiers[@class_info.spell_ability],
          attack_bonus: proficiency_bonus + modifiers[@class_info.spell_ability],
          cantrips_amount: cantrips_amount,
          max_spell_level: spells_slots.keys.max || 1,
          prepared_spells_amount: prepared_spells_amount,
          multiclass_spell_level: (class_level / @class_info.multiclass_spell_level.to_f).round
        }
      end

      def spells_slots
        @spells_slots ||=
          (@class_info.spell_slots[class_level.to_s] || @class_info.spell_slots['20'] || {}).transform_keys(&:to_i)
      end

      def class_level
        @class_level ||= classes[@class_name]
      end

      def cantrips_amount
        @class_info.cantrips[@class_info.cantrips.keys.map(&:to_i).select { |item| item <= class_level }.max.to_s]
      end

      def prepared_spells_amount
        @class_info.prepared_spells[@class_info.prepared_spells.keys.map(&:to_i).select { |item| item <= class_level }.max.to_s]
      end
    end
  end
end
