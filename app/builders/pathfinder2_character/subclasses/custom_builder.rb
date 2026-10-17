# frozen_string_literal: true

module Pathfinder2Character
  module Subclasses
    class CustomBuilder
      def initialize(subclass_name:)
        @info = ::Pathfinder2::Homebrews::Subclass.find_by(id: subclass_name).info
      end

      def call(result:) # rubocop: disable Metrics/AbcSize
        result[:skill_boosts].merge!(@info.skill_boosts) { |_, oldval, newval| oldval + newval }
        result[:feats] = result[:feats].concat(@info.feats).uniq
        result[:spells] = result[:spells].push(@info.spells).uniq
        result[:focus_spells] = result[:focus_spells].concat(@info.focus_spells).uniq
        result[:spell_list] = @info.spell_list if @info.spell_list

        result
      end
    end
  end
end
