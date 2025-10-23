# frozen_string_literal: true

module Dnd5Character
  class OverallDecorator < ApplicationDecorator
    def save_dc
      @save_dc ||= begin
        result = __getobj__.save_dc
        class_save_dc.each do |class_saving_throw|
          result[class_saving_throw] += proficiency_bonus
        end
        result
      end
    end

    def formatted_static_spells
      return @formatted_static_spells if defined?(@formatted_static_spells)

      formatted_static_spells = __getobj__.static_spells
      return [] if formatted_static_spells.blank?

      @formatted_static_spells = Dnd5::Spell.where(slug: formatted_static_spells.keys).map do |spell|
        static_spell = formatted_static_spells[spell.slug]

        {
          id: spell.id,
          slug: spell.slug,
          name: spell.name[I18n.locale.to_s],
          level: spell.data.level,
          data: static_spell,
          ready_to_use: true
        }
      end
    end
  end
end
