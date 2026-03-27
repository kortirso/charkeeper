# frozen_string_literal: true

class CosmereDecorator < ApplicationDecoratorV2
  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    calculate_secondary_abilities

    self
  end

  private

  def generate_basis
    @result['name'] = @character.name
    @result['tier'] = find_tier
  end

  def calculate_secondary_abilities # rubocop: disable Metrics/AbcSize
    @result['skills'] = generate_skills_payload
    @result['defense'] = {
      'physical' => 10 + abilities['str'] + abilities['spd'],
      'cognitive' => 10 + abilities['int'] + abilities['wil'],
      'spiritual' => 10 + abilities['awa'] + abilities['pre']
    }
    @result['deflect'] = 0
    @result['health_max'] = 10 + abilities['str']
    @result['focus_max'] = 2 + abilities['wil']
    @result['investiture_max'] = 2 + [abilities['awa'], abilities['pre']].max
    @result['load'] = find_load
    @result['movement'] = find_movement
    @result['recovery_die'] = find_recovery_die
    @result['senses_range'] = find_senses_range
  end

  def generate_skills_payload
    (
      [
        %w[agility spd], %w[athletics str], %w[heavy_weaponry str], %w[light_weaponry spd],
        %w[stealth spd], %w[thievery spd], %w[crafting int], %w[deduction int],
        %w[discipline wil], %w[intimidation wil], %w[lore int], %w[medicine int],
        %w[deception pre], %w[insight awa], %w[leadership pre], %w[perception awa],
        %w[persuation pre], %w[survival awa]
      ] + additional_skills.map { |(key, values)| [key, values['ability']] }
    ).map { |item| skill_payload(item[0], item[1]) }
  end

  def skill_payload(slug, ability)
    skill_level = selected_skills[slug].to_i
    {
      slug: slug,
      ability: ability,
      level: skill_level,
      modifier: skill_level + abilities[ability]
    }
  end

  def find_tier
    return 5 if level >= 21
    return 4 if level >= 16
    return 3 if level >= 11
    return 2 if level >= 6

    1
  end

  def find_load
    case abilities['str']
    when 0 then 50
    when 1, 2 then 100
    when 3, 4 then 250
    when 5, 6 then 500
    when 7, 8 then 2_500
    else 5_000
    end
  end

  def find_movement
    case abilities['spd']
    when 0 then 20
    when 1, 2 then 25
    when 3, 4 then 30
    when 5, 6 then 40
    when 7, 8 then 60
    else 80
    end
  end

  def find_recovery_die
    case abilities['wil']
    when 0 then 4
    when 1, 2 then 6
    when 3, 4 then 8
    when 5, 6 then 10
    when 7, 8 then 12
    else 20
    end
  end

  def find_senses_range
    case abilities['awa']
    when 0 then 5
    when 1, 2 then 10
    when 3, 4 then 20
    when 5, 6 then 50
    when 7, 8 then 100
    end
  end
end
