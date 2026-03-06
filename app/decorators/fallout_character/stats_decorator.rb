# frozen_string_literal: true

module FalloutCharacter
  class StatsDecorator < ApplicationDecorator
    def modified_abilities
      @modified_abilities ||= abilities
    end

    def max_health
      modified_abilities['end'] + modified_abilities['lck'] + (level - 1)
    end

    def skills
      @skills ||= [
        %w[athletics str], %w[barter cha], %w[big_guns end], %w[energy_weapons per], %w[explosives per],
        %w[lockpick per], %w[medicine int], %w[melee_weapons str], %w[pilot per], %w[repair int],
        %w[science int], %w[small_guns agi], %w[sneak agi], %w[speech cha], %w[survival end],
        %w[throwing agi], %w[unarmed str]
      ].map { |item| skill_payload(item[0], item[1]) }
    end

    def attacks
      @attacks ||= character_weapons.map { |item| calculate_attack(item) }
    end

    private

    def skill_payload(slug, ability)
      level = data.skills[slug].to_i
      expertise = tag_skills.include?(slug)
      {
        slug: slug,
        ability: ability,
        modifier: [level + (expertise ? 2 : 0), 6].min,
        level: level,
        expertise: expertise,
        attribute_modifier: modified_abilities[ability]
      }
    end

    def calculate_attack(item)
      {
        id: item[:id],
        name: translate(item[:items_name]),
        kind: item[:items_kind],
        damage: item.dig(:items_info, 'rating'),
        distance: item.dig(:items_info, 'range'),
        notes: item[:notes] || [],
        damage_types: [item.dig(:items_info, 'damage')],
        ready_to_use: item[:state] ? item[:state].in?(::Character::Item::HANDS) : true,
        tags: {}
      }
    end

    def character_weapons
      parent
        .items
        .joins(:item)
        .where(items: { kind: %w[melee_weapons small_guns] })
        .hashable_pluck('items.name', 'items.kind', 'items.info', :notes, :state, :id)
    end
  end
end
