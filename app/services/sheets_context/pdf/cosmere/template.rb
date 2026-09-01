# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Cosmere
      class Template < SheetsContext::Pdf::Template
        include Deps[markdown: 'markdown']

        # rubocop: disable-next Metrics/AbcSize, Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Layout/LineLength
        def to_pdf(character:, phtml: nil)
          super

          character.defense.each_with_index do |(slug, value), index|
            font_size 6
            fill_color 'FFFFFF'
            text_box I18n.t("services.sheets_context.cosmere.#{slug}"), at: [86 + (188 * index), 722], width: 43, align: :center

            font_size 14
            fill_color '000000'
            text_box value.to_s, at: [88 + (188 * index), 706], width: 39, align: :center
          end

          abilities_names = ::Cosmere::Character.abilities
          font_size 6
          fill_color 'FFFFFF'
          %w[str spd].each_with_index do |item, index|
            ability_name = translate(abilities_names[item]['name'])
            text_box ability_name, at: [33 + (100 * index), 734], width: 49, align: :center
          end
          %w[int wil].each_with_index do |item, index|
            ability_name = translate(abilities_names[item]['name'])
            text_box ability_name, at: [221 + (100 * index), 734], width: 49, align: :center
          end
          %w[awa pre].each_with_index do |item, index|
            ability_name = translate(abilities_names[item]['name'])
            text_box ability_name, at: [409 + (100 * index), 734], width: 49, align: :center
          end
          text_box I18n.t('services.sheets_context.cosmere.health'), at: [82, 667], width: 51, align: :center
          text_box I18n.t('services.sheets_context.cosmere.focus'), at: [270, 667], width: 51, align: :center
          text_box I18n.t('services.sheets_context.cosmere.investiture'), at: [459, 667], width: 51, align: :center

          text_box I18n.t('services.sheets_context.cosmere.deflect'), at: [63, 619], width: 49, align: :center
          text_box I18n.t('services.sheets_context.cosmere.speed'), at: [121, 619], width: 49, align: :center
          text_box I18n.t('services.sheets_context.cosmere.senses'), at: [179, 619], width: 49, align: :center
          text_box I18n.t('services.sheets_context.cosmere.lifting'), at: [92, 566], width: 49, align: :center
          text_box I18n.t('services.sheets_context.cosmere.recovery'), at: [150, 566], width: 49, align: :center

          font_size 12
          fill_color '000000'
          text_box "#{character.health} / #{character.health_max}", at: [57, 658], width: 100, align: :center
          text_box "#{character.focus} / #{character.focus_max}", at: [245, 658], width: 100, align: :center
          text_box "#{character.investiture} / #{character.investiture_max}", at: [434, 658], width: 100, align: :center

          text_box character.deflect.to_s, at: [65, 600], width: 45, align: :center
          text_box "#{character.movement} ft", at: [123, 600], width: 45, align: :center
          text_box "#{character.senses_range} ft", at: [181, 600], width: 45, align: :center
          text_box character.load.to_s, at: [94, 547], width: 45, align: :center
          text_box "1d#{character.recovery_die}", at: [152, 547], width: 45, align: :center

          font_size 14
          %w[str spd].each_with_index do |item, index|
            text_box character.abilities[item].to_s, at: [35 + (index * 100), 716], width: 45, align: :center
          end
          %w[int wil].each_with_index do |item, index|
            text_box character.abilities[item].to_s, at: [223 + (index * 100), 716], width: 45, align: :center
          end
          %w[awa pre].each_with_index do |item, index|
            text_box character.abilities[item].to_s, at: [411 + (index * 100), 716], width: 45, align: :center
          end

          font_size 10
          index = 0
          %w[str spd int wil awa pre].each do |ability|
            character.skills.select { |item| item[:ability] == ability }.each do |skill|
              text_box skill[:name], at: [52, 468 - (index * 20)], width: 140
              text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 469 - (index * 20)], width: 38, align: :center
              index += 1
            end
          end
          text_box I18n.t('services.sheets_context.cosmere.attacks'), at: [347, 609], width: 175, align: :center
          text_box I18n.t('services.sheets_context.cosmere.skills'), at: [70, 496], width: 150, align: :center
          text_box I18n.t('services.sheets_context.cosmere.expertises'), at: [347, 262], width: 175, align: :center

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.attack'), at: [430, 589], width: 30, height: 10, align: :center
          text_box I18n.t('services.sheets_context.damage'), at: [485, 589], width: 35, height: 10, align: :center
          text_box I18n.t('services.sheets_context.dist'), at: [520, 589], width: 30, height: 10, align: :center

          fill_color '000000'
          character.attacks.sort_by { |item| item[:ready_to_use] ? 0 : 1 }.first(8).each_with_index do |attack, index|
            font_size 8
            formatted_text_box [{ text: attack[:name], styles: attack[:ready_to_use] ? [:bold] : [], color: attack[:ready_to_use] ? '000000' : '444444' }], at: [327, 579 - (index * 36)], width: 100, height: 14

            font_size 6
            text_box "#{'+' if attack[:attack_bonus].positive?}#{attack[:attack_bonus]}", at: [430, 579 - (index * 36)], width: 30, height: 14, align: :center

            damage = attack[:damage].include?('d') ? "#{attack[:damage]}#{'+' if attack[:damage_bonus].positive?}#{attack[:damage_bonus] unless attack[:damage_bonus].zero?}" : ((attack[:damage].to_i + attack[:damage_bonus]).positive? ? (attack[:damage].to_i + attack[:damage_bonus]).to_s : '-') # rubocop: disable Style/NestedTernaryOperator
            text_box damage.to_s, at: [485, 579 - (index * 36)], width: 35, height: 14, align: :center

            if attack[:distance]
              text_box attack[:distance].to_s, at: [520, 579 - (index * 36)], width: 30, height: 14, align: :center
            end

            text_box attack[:tags].values.join(' / '), at: [327, 563 - (index * 36)], width: 220, height: 14
          end

          render_equipment_page(character)

          font_size 10
          fill_color '000000'
          character.goals.first(10).each_with_index do |goal, index|
            text_box goal['text'].to_s, at: [52, 237 - (index * 20)], width: 140
            text_box "#{goal['counter']} / 3", at: [200, 237 - (index * 20)], width: 38, align: :center
          end
          character.connections.first(8).each_with_index do |connection, index|
            text_box connection['text'].to_s, at: [350, 232 - (index * 24)], width: 200
          end
          text_box I18n.t('services.sheets_context.cosmere.goals'), at: [70, 264], width: 150, align: :center
          text_box I18n.t('services.sheets_context.cosmere.connections'), at: [375, 264], width: 150, align: :center

          text_box character.purpose.to_s, at: [30, 316], width: 250
          text_box character.obstacle.to_s, at: [335, 316], width: 250

          font_size 8
          fill_color 'FFFFFF'
          text_box I18n.t('services.sheets_context.cosmere.purpose'), at: [29, 332], width: 83, align: :center
          text_box I18n.t('services.sheets_context.cosmere.obstacle'), at: [334, 332], width: 83, align: :center

          start_new_page

          render
        end

        private

        def render_equipment_page(character) # rubocop: disable Metrics/MethodLength, Metrics/PerceivedComplexity, Metrics/CyclomaticComplexity, Metrics/AbcSize
          start_new_page

          font_size 10
          fill_color '000000'
          text_box I18n.t('services.sheets_context.equipment'), at: [210, 819], width: 175, align: :center

          font_size 4
          fill_color '444444'
          text_box I18n.t('services.sheets_context.count'), at: [242, 736], width: 40, height: 10, align: :center
          text_box I18n.t('services.sheets_context.count'), at: [509, 792], width: 40, height: 10, align: :center

          row_index = 0
          column_index = 0
          items = character.parent.items.includes(:item).to_a.sort_by { |item| item.name.presence || translate(item.item.name) }

          fill_color '000000'
          %w[hands equipment backpack storage].each do |key|
            next if column_index == 2

            items.select { |item| item.states[key]&.positive? }.each do |item|
              next if column_index == 2

              # rubocop: disable Layout/LineLength
              font_size 8
              text_box item.name || translate(item.item.name), at: [52 + (column_index * 267), 726 - (row_index * 28)], width: 140, height: 14
              text_box item.states[key].to_s, at: [242 + (column_index * 267), 726 - (row_index * 28)], width: 40, height: 14, align: :center

              font_size 5
              text_box I18n.t("services.sheets_context.equipments.#{key}"), at: [202 + (column_index * 267), 724 - (row_index * 28)], width: 40, height: 14, align: :center
              # rubocop: enable Layout/LineLength

              if row_index == 12
                row_index = -2
                column_index += 1
              else
                row_index += 1
              end
            end
          end
        end

        def heritage(character)
          [
            translate(::Cosmere::Character.ancestry_info(character.ancestry)['name']),
            character.cultures.map { |item| translate(::Cosmere::Character.cultures_info(item)['name']) }.join('/')
          ].flatten.join(' - ')
        end

        def classes(character)
          translate(::Cosmere::Character.paths_info(character.data.path)['name'])
        end
      end
    end
  end
end
