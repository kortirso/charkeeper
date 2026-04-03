# frozen_string_literal: true

class Pathfinder2PetDecorator < ApplicationDecoratorV2
  ARMOR_TYPES = %w[armor shield].freeze
  PET_SKILLS = %w[acrobatics athletics].freeze

  def call(pet:)
    @result = {}
    @pet = pet
    @character = pet.character
    @attributes = pet.character.data

    generate_basis

    self
  end

  private

  def generate_basis # rubocop: disable Metrics/AbcSize
    @result['level'] = @attributes.level
    @result['saving_throws_value'] = {
      'fortitude' => abilities['con'] + proficiency_bonus(@attributes.saving_throws['fortitude']),
      'reflex' => abilities['dex'] + proficiency_bonus(@attributes.saving_throws['reflex']),
      'will' => abilities['wis'] + proficiency_bonus(@attributes.saving_throws['will'])
    }
    @result['health_max'] = 5 * level
    @result['armor_class'] = calc_armor_class
    @result['speed'] = 25
    @result['perception'] = find_perception
    @result['skills'] = generate_skills_payload
  end

  def abilities
    @abilities ||= @attributes.abilities.transform_values { |value| calc_ability_modifier(value) }
  end

  def find_perception
    for_pet = 3 + level
    return for_pet if @pet.data.kind == 'pet'

    [abilities[@attributes.main_ability] + level, for_pet].max
  end

  def proficiency_bonus(proficiency_level)
    return 0 if proficiency_level.to_i.zero?

    level + (proficiency_level * 2)
  end

  def calc_ability_modifier(value)
    (value / 2) - 5
  end

  def generate_skills_payload
    [
      %w[acrobatics dex], %w[arcana int], %w[athletics str], %w[crafting int],
      %w[deception cha], %w[diplomacy cha], %w[intimidation cha], %w[medicine wis],
      %w[nature wis], %w[occultism int], %w[performance cha], %w[religion wis],
      %w[society int], %w[stealth dex], %w[survival wis], %w[thievery dex]
    ].map { |item| skill_payload(item[0], item[1]) }
  end

  def skill_payload(slug, ability)
    modifier =
      if PET_SKILLS.include?(slug)
        for_pet = 3 + level
        @pet.data.kind == 'familiar' ? [abilities[@attributes.main_ability] + level, for_pet].max : for_pet
      else
        level
      end
    {
      slug: slug,
      ability: ability,
      modifier: modifier
    }
  end

  def calc_armor_class # rubocop: disable Metrics/AbcSize
    equiped_armor = defense_gear[:armor]
    equiped_shield = defense_gear[:shield]

    result = 10
    if equiped_armor
      result += [abilities['dex'], equiped_armor.dig(:items_info, 'dex_max')].compact.min # модификатор ловкости
      result += proficiency_bonus(@attributes.armor_skills[equiped_armor.dig(:items_info, 'armor_skill')]) # бонус мастерства
      result += equiped_armor.dig(:items_info, 'ac')
    else
      result += abilities['dex'] # модификатор ловкости
      result += proficiency_bonus(@attributes.armor_skills['unarmored']) # бонус мастерства
    end
    result += equiped_shield.dig(:items_info, 'ac') if equiped_shield

    result
  end

  def defense_gear
    @defense_gear ||= find_defense_gear
  end

  def find_defense_gear
    armor, shield =
      active_items
        .select { |item| ARMOR_TYPES.include?(item[:items_kind]) }
        .partition { |item| item[:items_kind] != 'shield' }
    {
      armor: armor.blank? ? nil : armor[0],
      shield: shield.blank? ? nil : shield[0]
    }
  end

  def active_items
    @character
      .items
      .where("states->>'hands' != ? OR states->>'equipment' != ?", '0', '0')
      .joins(:item)
      .hashable_pluck('items.kind', 'items.data', 'items.info', 'items.modifiers', :states, :modifiers)
  end
end
