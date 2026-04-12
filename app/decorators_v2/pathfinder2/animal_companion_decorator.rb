# frozen_string_literal: true

module Pathfinder2
  class AnimalCompanionDecorator < ApplicationDecoratorV2
    include Pathfinder2::Concerns

    def call(animal:)
      @animal = animal
      @result = animal.data.attributes

      generate_basis

      self
    end

    private

    def generate_basis # rubocop: disable Metrics/AbcSize
      @result['level'] = @animal.character.data.level
      @result['saving_throws_value'] = {
        'fortitude' => abilities['con'] + proficiency_bonus(saving_throws['fortitude']),
        'reflex' => abilities['dex'] + proficiency_bonus(saving_throws['reflex']),
        'will' => abilities['wis'] + proficiency_bonus(saving_throws['will'])
      }
      @result['health_max'] = config['health'] + ((6 + abilities['con']) * level)
      @result['armor_class'] = calc_armor_class
      @result['speed'] = speeds['default'] || 0
      @result['speeds'] = speeds.except('default')
      @result['skills'] = generate_skills_payload
      @result['attacks'] = config['attacks'].map { |attack| attack_payload(attack) }
      @result['support'] = translate(config['support'])
    end

    def attack_payload(attack) # rubocop: disable Metrics/AbcSize
      key_ability_bonus = find_key_ability_bonus(attack['type'], attack['tooltips'])
      damage_types = attack['damage_type'].split('-')
      {
        slug: attack['slug'],
        name: translate(attack['name']),
        attack_bonus: key_ability_bonus + proficiency_bonus(weapon_skills[attack['weapon_skill']]),
        damage: attack['damage'].gsub('1d', damage_dice),
        damage_bonus: abilities['str'],
        tags: (damage_types + attack['tooltips']).index_with { |type| I18n.t("tags.pathfinder2.weapon.title.#{type}") }
      }
    end

    def damage_dice
      case age
      when 'young' then '1d'
      when 'specialized' then '3d'
      else '2d'
      end
    end

    def find_key_ability_bonus(type, tooltips=[])
      return [abilities['str'], abilities['dex']].max if tooltips.include?('finesse')
      return abilities['str'] if type == 'melee'

      abilities['dex']
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
      prof_bonus = proficiency_bonus(selected_skills[slug].to_i)
      {
        slug: slug,
        ability: ability,
        modifier: abilities[ability] + prof_bonus
      }
    end

    def calc_armor_class
      10 + abilities['dex'] + proficiency_bonus(armor_skills['unarmored'])
    end

    def config
      @config ||= ::Config.data('pathfinder2', 'animals')[kind]
    end
  end
end
