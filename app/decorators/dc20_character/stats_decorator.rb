# frozen_string_literal: true

module Dc20Character
  class StatsDecorator < ApplicationDecorator
    def modified_abilities
      @modified_abilities ||= __getobj__.modified_abilities.merge('prime' => __getobj__.modified_abilities.values.max)
    end

    def save_dc
      @save_dc ||= 10 + modified_abilities['prime'] + combat_mastery
    end

    def precision_defense # rubocop: disable Metrics/AbcSize
      return @precision_defense if defined?(@precision_defense)

      default = 8 + combat_mastery + modified_abilities['agi'] + modified_abilities['int'] + equiped_armor_info&.dig('pd').to_i +
                equiped_shield_info&.dig('pd').to_i
      @precision_defense ||= {
        default: default + guard_bonuses,
        heavy: default + 5 + guard_bonuses,
        brutal: default + 10 + guard_bonuses
      }
    end

    def area_defense
      return @area_defense if defined?(@area_defense)

      default = 8 + combat_mastery + modified_abilities['mig'] + modified_abilities['cha'] + equiped_armor_info&.dig('ad').to_i +
                equiped_shield_info&.dig('ad').to_i
      @area_defense ||= {
        default: default,
        heavy: default + 5,
        brutal: default + 10
      }
    end

    def attack
      @attack ||= modified_abilities['prime'] + combat_mastery
    end

    def skills
      @skills ||= [
        %w[acrobatics agi], %w[animal cha], %w[athletics mig], %w[awareness prime],
        %w[influence cha], %w[insight cha], %w[intimidation mig], %w[investigation int],
        %w[trickery agi], %w[stealth agi], %w[medicine int], %w[survival int]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def trades
      @trades ||=
        [
          %w[arcana int], %w[history int], %w[nature int], %w[occultism int], %w[religion int]
        ].map { |item| trade_payload(item[0], item[1]) } +
        trade_knowledge.map { |item| trade_payload(item[0], item[1]) }
    end

    def initiative
      @initiative ||= modified_abilities['agi'] + combat_mastery
    end

    def grit_points
      @grit_points ||= data.grit_points.merge('max' => modified_abilities['cha'] + 2)
    end

    def equiped_armor_info
      @equiped_armor_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .where(items: { kind: 'armor' })
        .pick('items.info')
    end

    def health
      @health ||= __getobj__.data.health.merge(
        'death_threshold' => 0 - modified_abilities['prime'] - combat_mastery
      )
    end

    def attribute_saves
      @attribute_saves ||= modified_abilities.transform_values { |item| item + combat_mastery }
    end

    def physical_save
      @physical_save ||= attribute_saves.slice('mig', 'agi').values.max
    end

    def mental_save
      @mental_save ||= attribute_saves.slice('cha', 'int').values.max
    end

    def attacks
      @attacks ||= [unarmed_attack, shield_attack].compact + character_weapons.map { |item| calculate_attack(item) }
    end

    def stamina_points
      @stamina_points ||=
        __getobj__.stamina_points.merge(
          'max' => __getobj__.stamina_points['max'] + (paths['martial'] / (path.include?('martial') ? 2.0 : 2)).round
        )
    end

    def mana_points
      @mana_points ||= __getobj__.mana_points.merge(
        'max' => __getobj__.mana_points['max'] + (paths['spellcaster'] * 2)
      )
    end

    def maneuver_points
      @maneuver_points ||= __getobj__.maneuver_points + paths['martial']
    end

    def cantrips
      @cantrips ||= __getobj__.cantrips + ((paths['spellcaster'] + 1) / 2)
    end

    def spells
      @spells ||= __getobj__.spells + paths['spellcaster']
    end

    def jump
      @jump = [modified_abilities['agi'], 1].max
    end

    def breath
      @breath = [modified_abilities['mig'], 1].max
    end

    private

    def guard_bonuses
      attacks.count { |attack| attack[:ready_to_use] && attack[:features].include?('Guard') }
    end

    def unarmed_attack
      {
        name: { en: 'Unarmed', ru: 'Безоружная' }[I18n.locale],
        attack_bonus: modified_abilities['prime'] + combat_mastery,
        damage: 0,
        damage_types: ['b'],
        features: [],
        features_text: [],
        notes: [],
        ready_to_use: true,
        tags: { 'b' => I18n.t('tags.dc20.weapon.title.b') }
      }
    end

    def shield_attack
      return if equiped_shield_info.nil?
      return if combat_expertise.exclude?(equiped_shield_info['type'])

      {
        name: { en: 'Shield attack', ru: 'Удар щитом' }[I18n.locale],
        attack_bonus: modified_abilities['prime'] + combat_mastery,
        damage: 1,
        damage_types: ['b'],
        features: [],
        features_text: [],
        notes: [],
        ready_to_use: true,
        tags: { 'b' => I18n.t('tags.dc20.weapon.title.b') }
      }
    end

    # rubocop: disable Metrics/AbcSize
    def calculate_attack(item)
      result = {
        name: item.dig(:items_name, I18n.locale.to_s),
        attack_bonus: modified_abilities['prime'] + combat_mastery,
        distance: item.dig(:items_info, 'distance'),
        damage: item.dig(:items_info, 'damage'),
        damage_types: item.dig(:items_info, 'damage_types'),
        features: item.dig(:items_info, 'features'),
        notes: item[:notes] || [],
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true,
        tags: item.dig(:items_info, 'damage_types').index_with { |type| I18n.t("tags.dc20.weapon.title.#{type}") }
      }

      result[:features] += item.dig(:items_info, 'styles') if combat_expertise.include?('weapon')
      result[:features_text] = result[:features].map { |feature| I18n.t("tags.dc20.weapon.#{feature}") }
      result[:tags] =
        result[:tags].merge(result[:features].index_with { |feature| I18n.t("tags.dc20.weapon.title.#{feature}") })

      result
    end
    # rubocop: enable Metrics/AbcSize

    def character_weapons
      parent
        .items
        .joins(:item)
        .where(items: { kind: 'weapon' })
        .hashable_pluck('items.slug', 'items.name', 'items.kind', 'items.info', :notes, :state)
    end

    def skill_payload(slug, ability)
      level = skill_levels[slug].to_i
      {
        slug: slug,
        ability: ability,
        modifier: modified_abilities[ability] + (level * 2),
        level: level,
        expertise: skill_expertise.include?(slug)
      }
    end

    def trade_payload(slug, ability)
      level = trade_levels[slug].to_i
      {
        slug: slug,
        ability: ability,
        modifier: modified_abilities[ability] + (level * 2),
        level: level,
        expertise: trade_expertise.include?(slug)
      }
    end
  end
end
