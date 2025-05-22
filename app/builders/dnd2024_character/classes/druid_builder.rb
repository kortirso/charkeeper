# frozen_string_literal: true

module Dnd2024Character
  module Classes
    class DruidBuilder
      LANGUAGES = %w[druidic].freeze
      WEAPON_CORE = ['light weapon'].freeze
      ARMOR = ['light armor', 'shield'].freeze
      TOOLS = %w[herbalism].freeze

      # rubocop: disable Metrics/AbcSize
      def call(result:)
        result[:languages] = result[:languages].concat(LANGUAGES).uniq
        result[:weapon_core_skills] = result[:weapon_core_skills].concat(WEAPON_CORE).uniq
        result[:armor_proficiency] = result[:armor_proficiency].concat(ARMOR).uniq
        result[:tools] = result[:tools].concat(TOOLS).uniq
        result[:abilities] = { str: 11, dex: 13, con: 12, int: 14, wis: 15, cha: 10 }
        result[:health] = { current: 9, max: 9, temp: 0 }
        result[:hit_dice][8] = 1

        result
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
