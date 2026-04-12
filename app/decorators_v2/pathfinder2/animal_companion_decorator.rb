# frozen_string_literal: true

module Pathfinder2
  class AnimalCompanionDecorator < ApplicationDecoratorV2
    include Pathfinder2::Concerns

    def call(animal:)
      @result = animal.data.attributes

      generate_basis

      self
    end

    private

    def generate_basis # rubocop: disable Metrics/AbcSize
      @result['saving_throws_value'] = {
        'fortitude' => abilities['con'] + proficiency_bonus(saving_throws['fortitude']),
        'reflex' => abilities['dex'] + proficiency_bonus(saving_throws['reflex']),
        'will' => abilities['wis'] + proficiency_bonus(saving_throws['will'])
      }
      @result['health_max'] = config['health'] + ((6 + abilities['con']) * level)
      @result['armor_class'] = calc_armor_class
      @result['speed'] = speeds['default'] || speeds.first.to_h
      @result['skills'] = generate_skills_payload
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
