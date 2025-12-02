# frozen_string_literal: true

require 'redcarpet'
require 'redcarpet/render_strip'

class ActiveMarkdown
  INITIAL_VERSION = '0.3.16'

  def call(value:, version: nil, initial_version: nil)
    return value if value.blank?
    return demarked_value(value) if version.nil?
    return demarked_value(value) if Gem::Version.new(version) < Gem::Version.new(initial_version || INITIAL_VERSION)

    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
    markdown.render(value)
  end

  private

  def demarked_value(value)
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
    markdown.render(value)
  end
end
