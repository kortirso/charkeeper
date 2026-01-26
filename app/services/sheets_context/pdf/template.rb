# frozen_string_literal: true

module SheetsContext
  module Pdf
    class Template < Prawn::Document
      # rubocop: disable Metrics/AbcSize
      def to_pdf(character:)
        font_families.update(
          'CascadiaMono' => {
            normal: Rails.root.join('app/assets/fonts/CascadiaMono-Light.ttf'),
            bold: Rails.root.join('app/assets/fonts/CascadiaMono-Regular.ttf'),
            italic: Rails.root.join('app/assets/fonts/CascadiaMono-LightItalic.ttf')
          }
        )
        font 'CascadiaMono'

        font_size 12
        fill_color 'FFFFFF'
        text_box character.name, at: [30, 812], width: 180

        font_size 6
        text_box I18n.t('services.sheets_context.level'), at: [531, 785], width: 40, align: :center

        font_size 8
        fill_color '000000'
        text_box heritage(character), at: [270, 815], width: 230
        text_box classes(character), at: [270, 796], width: 230

        font_size 14
        stroke_color '000000'
        text_box character.level.to_s, at: [533, 809], width: 37, height: 18, align: :center
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
