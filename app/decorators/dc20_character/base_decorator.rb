# frozen_string_literal: true

module Dc20Character
  class BaseDecorator < SimpleDelegator
    delegate :id, :name, :data, to: :__getobj__
    delegate :abilities, :main_class, :level, :combat_expertise, :health, :classes, :attribute_points, :ancestries, :skill_levels,
             :skill_expertise, :skill_points, :skill_expertise_points, :trade_points, :trade_expertise_points, :language_points,
             :trade_levels, :trade_expertise, :trade_knowledge, :language_levels, :conditions, to: :data

    def parent = __getobj__
    def method_missing(_method, *args); end

    def modified_abilities
      @modified_abilities ||= abilities.merge('prime' => abilities.values.max)
    end

    def combat_mastery
      @combat_mastery ||= (level / 2.0).round
    end

    def attribute_saves
      @attribute_saves ||= abilities.transform_values { |item| item + combat_mastery }
    end

    def physical_save
      @physical_save ||= attribute_saves.slice('mig', 'agi').values.max
    end

    def mental_save
      @mental_save ||= attribute_saves.slice('cha', 'int').values.max
    end

    def save_dc
      @save_dc ||= 10 + modified_abilities['prime'] + combat_mastery
    end

    def precision_defense
      return @precision_defense if defined?(@precision_defense)

      default = 8 + combat_mastery + modified_abilities['agi'] + modified_abilities['int'] + equiped_armor_info&.dig('pd').to_i +
                equiped_shield_info&.dig('pd').to_i
      @precision_defense ||= {
        default: default,
        heavy: default + 5,
        brutal: default + 10
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

    def equiped_armor_info
      @equiped_armor_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::ACTIVE_STATES)
        .joins(:item)
        .where(items: { kind: 'armor' })
        .pick('items.info')
    end

    def equiped_shield_info
      @equiped_shield_info ||=
        __getobj__
        .items
        .where(state: ::Character::Item::HANDS)
        .joins(:item)
        .where(items: { kind: 'shield' })
        .pick('items.info')
    end

    private

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
