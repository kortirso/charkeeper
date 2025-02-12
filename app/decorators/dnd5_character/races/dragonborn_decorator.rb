# frozen_string_literal: true

module Dnd5Character
  module Races
    class DragonbornDecorator
      LANGUAGES = %w[common draconic].freeze
      ANCESTRIES = {
        'draconic_ancestry_black' => {
          'damage_type' => { 'en' => 'acid', 'ru' => 'кислота' },
          'attack_type' => { 'en' => 'line', 'ru' => 'линия' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_blue' => {
          'damage_type' => { 'en' => 'lightning', 'ru' => 'электричество' },
          'attack_type' => { 'en' => 'line', 'ru' => 'линия' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_brass' => {
          'damage_type' => { 'en' => 'fire', 'ru' => 'огонь' },
          'attack_type' => { 'en' => 'line', 'ru' => 'линия' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_bronze' => {
          'damage_type' => { 'en' => 'lightning', 'ru' => 'электричество' },
          'attack_type' => { 'en' => 'line', 'ru' => 'линия' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_copper' => {
          'damage_type' => { 'en' => 'acid', 'ru' => 'кислота' },
          'attack_type' => { 'en' => 'line', 'ru' => 'линия' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_gold' => {
          'damage_type' => { 'en' => 'fire', 'ru' => 'огонь' },
          'attack_type' => { 'en' => 'code', 'ru' => 'конус' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_green' => {
          'damage_type' => { 'en' => 'poison', 'ru' => 'яд' },
          'attack_type' => { 'en' => 'code', 'ru' => 'конус' },
          'dist' => 30,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        },
        'draconic_ancestry_red' => {
          'damage_type' => { 'en' => 'fire', 'ru' => 'огонь' },
          'attack_type' => { 'en' => 'code', 'ru' => 'конус' },
          'dist' => 30,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_silver' => {
          'damage_type' => { 'en' => 'cold', 'ru' => 'холод' },
          'attack_type' => { 'en' => 'code', 'ru' => 'конус' },
          'dist' => 30,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        },
        'draconic_ancestry_white' => {
          'damage_type' => { 'en' => 'cold', 'ru' => 'холод' },
          'attack_type' => { 'en' => 'code', 'ru' => 'конус' },
          'dist' => 30,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        }
      }.freeze

      def decorate_fresh_character(result:)
        result[:speed] = 30
        result[:languages] = result[:languages].concat(LANGUAGES).uniq

        result
      end

      # rubocop: disable Layout/LineLength, Metrics/MethodLength, Metrics/AbcSize
      def decorate_character_abilities(result:)
        draconic_ancestry = result.dig(:selected_features, 'draconic_ancestry')
        if draconic_ancestry
          ancestry_abilities = ANCESTRIES[draconic_ancestry]

          result[:conditions][:resistance] = result[:conditions][:resistance].push(ancestry_abilities['damage_type']).uniq

          damage_type = ancestry_abilities.dig('damage_type', I18n.locale.to_s)
          attack_type = ancestry_abilities.dig('attack_type', I18n.locale.to_s)
          save_type = ancestry_abilities.dig('save_type', I18n.locale.to_s)
          save_dc = 8 + result.dig(:modifiers, :con) + result[:proficiency_bonus]
          draconic_ancestry_damage = draconic_ancestry_damage(result[:overall_level])

          result[:features] << {
            slug: 'breath_weapon',
            kind: 'static',
            title: { en: 'Breath Weapon', ru: 'Оружие дыхания' }[I18n.locale],
            description: {
              en: "Each creature in the area of the exhalation (#{attack_type}, #{ancestry_abilities['dist']}) must make a saving throw #{save_type} (УС #{save_dc}). A creature takes  #{draconic_ancestry_damage} damage (#{damage_type}) on a failed save, and half as much damage on a successful one.",
              ru: "Все существа в зоне выдоха (#{attack_type}, #{ancestry_abilities['dist']}) должны совершить спасбросок #{save_type} (УС #{save_dc}). Существа получают #{draconic_ancestry_damage} урона (#{damage_type}) в случае проваленного спасброска, или половину этого урона, если спасбросок был успешен."
            }[I18n.locale],
            limit: 1
          }
        end

        result
      end
      # rubocop: enable Layout/LineLength, Metrics/MethodLength, Metrics/AbcSize

      private

      def draconic_ancestry_damage(overall_level)
        return '5d6' if overall_level >= 16
        return '4d6' if overall_level >= 11
        return '3d6' if overall_level >= 6

        '2d6'
      end
    end
  end
end
