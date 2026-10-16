# frozen_string_literal: true

module Pathfinder2
  module Classes
    class CustomDecorator < ApplicationDecoratorV2
      def call(result:, custom_class:)
        @result = result
        info = custom_class.info
        return unless info.spells_available

        @result['spells_info'] = info.only_focus_spells ? focus_spells_info(info) : simple_spells_info(info)
      end

      private

      def simple_spells_info(info)
        {
          'prepare' => info.cantrip_slots.present?,
          'learn' => spells_amount(info).present?,
          'cantrips_amount' => info.cantrips_amount,
          'spells_amount' => spells_amount(info),
          'cantrip_slots' => info.cantrip_slots,
          'spells_slots' => spells_slots(info),
          'max_spell_level' => spells_slots(info).keys.max,
          'class_dc' => class_dc,
          'spell_attack' => spell_attack,
          'spell_dc' => spell_dc
        }.compact
      end

      def spells_amount(info)
        @spells_amount ||=
          case info.spells_amount
          when 'none' then nil
          when 'wizard' then (level * 2) + 3
          when 'bard' then spells_slots(info).values.sum
          end
      end

      def focus_spells_info(info)
        {
          'only_focus' => true,
          'max_spell_level' => spells_slots(info).keys.max
        }
      end

      def spells_slots(info)
        @spells_slots ||=
          ::Pathfinder2::ClassDecorator::SPELL_SLOTS[[level, 20].min].to_h { |k, v|
            [k, k == 10 ? v : (v + info.additional_slots.to_i)]
          }
      end
    end
  end
end
