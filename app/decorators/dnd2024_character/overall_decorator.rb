# frozen_string_literal: true

module Dnd2024Character
  class OverallDecorator < ApplicationDecorator
    DEFAULT_SPEEDS = %w[swim climb].freeze

    def save_dc
      @save_dc ||= begin
        result = __getobj__.save_dc
        class_save_dc.each do |class_saving_throw|
          result[class_saving_throw] += proficiency_bonus
        end
        result
      end
    end

    def speed
      @speed ||= begin
        result = __getobj__.speed
        str_req = defense_gear[:armor]&.dig(:items_info, 'str_req')
        result -= 10 if str_req && str_req > modifiers['str']
        [result - (exhaustion * 5), 0].max
      end
    end

    def speeds
      @speeds ||=
        DEFAULT_SPEEDS.index_with { speed / 2 }.merge(__getobj__.speeds).transform_values { |value| value.zero? ? speed : value }
    end

    def formatted_static_spells
      return @formatted_static_spells if defined?(@formatted_static_spells)

      formatted_static_spells = __getobj__.static_spells
      return [] if formatted_static_spells.blank?

      @formatted_static_spells = ::Dnd2024::Feat.where(origin: 6, slug: formatted_static_spells.keys).map do |spell|
        static_spell = formatted_static_spells[spell.slug]

        {
          ready_to_use: true,
          feat_id: spell.id,
          spell: ::Dnd2024::SpellSerializer.new.serialize(spell).merge(data: static_spell)
        }
      end
    end
  end
end
