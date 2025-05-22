# frozen_string_literal: true

module Dnd5Character
  module Races
    class DragonbornDecorator < ApplicationDecorator
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
          'attack_type' => { 'en' => 'cone', 'ru' => 'конус' },
          'dist' => 15,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_green' => {
          'damage_type' => { 'en' => 'poison', 'ru' => 'яд' },
          'attack_type' => { 'en' => 'cone', 'ru' => 'конус' },
          'dist' => 15,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        },
        'draconic_ancestry_red' => {
          'damage_type' => { 'en' => 'fire', 'ru' => 'огонь' },
          'attack_type' => { 'en' => 'cone', 'ru' => 'конус' },
          'dist' => 15,
          'save_type' => { 'en' => 'Dex', 'ru' => 'Лов' }
        },
        'draconic_ancestry_silver' => {
          'damage_type' => { 'en' => 'cold', 'ru' => 'холод' },
          'attack_type' => { 'en' => 'cone', 'ru' => 'конус' },
          'dist' => 15,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        },
        'draconic_ancestry_white' => {
          'damage_type' => { 'en' => 'cold', 'ru' => 'холод' },
          'attack_type' => { 'en' => 'cone', 'ru' => 'конус' },
          'dist' => 15,
          'save_type' => { 'en' => 'Con', 'ru' => 'Тел' }
        }
      }.freeze

      def resistance
        @resistance ||= __getobj__.resistance.push(ANCESTRIES.dig(draconic_ancestry, 'damage_type', 'en')).uniq
      end

      # rubocop: disable Metrics/AbcSize, Layout/LineLength
      def features
        @features ||= begin
          result = __getobj__.features

          ancestry_abilities = ANCESTRIES[draconic_ancestry]
          damage_type = ancestry_abilities.dig('damage_type', I18n.locale.to_s)
          attack_type = ancestry_abilities.dig('attack_type', I18n.locale.to_s)
          save_type = ancestry_abilities.dig('save_type', I18n.locale.to_s)
          save_dc = 8 + modifiers['con'] + proficiency_bonus

          result << {
            slug: 'breath_weapon',
            kind: 'static',
            title: { en: 'Breath Weapon', ru: 'Оружие дыхания' }[I18n.locale],
            description: {
              en: "Each creature in the area of the exhalation (#{attack_type}, #{ancestry_abilities['dist']}) must make a saving throw #{save_type} (DC #{save_dc}). A creature takes #{draconic_ancestry_damage} damage (#{damage_type}) on a failed save, and half as much damage on a successful one.",
              ru: "Все существа в зоне выдоха (#{attack_type}, #{ancestry_abilities['dist']}) должны совершить спасбросок #{save_type} (УС #{save_dc}). Существа получают #{draconic_ancestry_damage} урона (#{damage_type}) в случае проваленного спасброска, или половину этого урона, если спасбросок был успешен."
            }[I18n.locale],
            limit: 1,
            limit_refresh: 'short_rest'
          }
        end
      end
      # rubocop: enable Metrics/AbcSize, Layout/LineLength

      private

      def draconic_ancestry
        @draconic_ancestry ||= selected_features['draconic_ancestry']
      end

      def draconic_ancestry_damage
        return '5d6' if level >= 16
        return '4d6' if level >= 11
        return '3d6' if level >= 6

        '2d6'
      end
    end
  end
end
