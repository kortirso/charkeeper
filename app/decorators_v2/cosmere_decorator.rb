# frozen_string_literal: true

class CosmereDecorator < ApplicationDecoratorV2
  def call(character:, simple: false, version: nil)
    @character = character
    @version = version
    @result = character.data.attributes

    generate_basis
    return self if simple

    calculate_secondary_abilities
    find_attacks

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

  def find_attacks
    @result['attacks'] =
      ([unarmed_weapon] + weapons).flat_map do |item|
        tooltips = parse_tooltips(item.dig(:items_info, 'tooltips'))
        expert_tooltips = parse_tooltips(item.dig(:items_info, 'expert_tooltips'))

        attack_values(item, tooltips, expert_tooltips)
      end
  end

  def parse_tooltips(tooltips)
    tooltips.to_h do |tooltip|
      items = tooltip.split('-')
      next items if items.size == 2

      items.push(nil)
      items
    end
  end

  def unarmed_weapon
    {
      items_slug: 'unarmed',
      items_name: { 'en' => 'Unarmed', 'ru' => 'Безоружная' },
      items_info: {
        'weapon_skill' => 'athletics',
        'type' => 'melee',
        'damage' => unarmed_damage,
        'damage_type' => 'impact',
        'tooltips' => %w[],
        'expert_tooltips' => %w[momentum offhand]
      }
    }
  end

  def unarmed_damage
    case abilities['str']
    when 0, 1, 2 then '1'
    when 3, 4 then '1d4'
    when 5, 6 then '1d8'
    when 7, 8 then '2d6'
    else '2d10'
    end
  end

  def attack_values(item, tooltips, expert_tooltips) # rubocop: disable Metrics/AbcSize
    damage_type = item.dig(:items_info, 'damage_type')
    skill = skills.find { |skill| skill[:slug] == item.dig(:items_info, 'weapon_skill') }
    {
      slug: item[:items_slug],
      name: translate(item[:items_name]),
      attack_bonus: skill[:modifier],
      damage: item.dig(:items_info, 'damage'),
      notes: item[:notes],
      tags: { damage_type => I18n.t("tags.cosmere.weapon.title.#{damage_type}") }.merge(
        tooltips.except('reach').to_h do |key, value|
          [key, I18n.t("tags.cosmere.weapon.title.#{key}", value: value)]
        end
      ),
      ready_to_use: item[:states] ? item.dig(:states, 'hands').positive? : true,
      distance: distance(item, tooltips, expert_tooltips)
    }.compact
  end

  def distance(item, tooltips, _expert_tooltips)
    return item.dig(:items_info, 'dist') if item.dig(:items_info, 'type') == 'ranged'
    return item.dig(:items_info, 'dist') if tooltips.key?('thrown')

    tooltips.key?('reach') ? 10 : nil
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

  def weapons
    @character
      .items
      .joins(:item)
      .where(items: { kind: 'weapon' })
      .hashable_pluck(
        'items.slug', 'items.name', 'items.kind', 'items.info', 'items.modifiers', :notes, :states, :modifiers, :name
      )
  end
end
