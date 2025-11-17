# frozen_string_literal: true

require 'redcarpet'
require 'redcarpet/render_strip'

class ActiveMarkdown
  INITIAL_VERSION = '0.3.16'

  def call(value:, version: nil)
    return demarked_value(value) if version.nil? || Gem::Version.new(version) < Gem::Version.new(INITIAL_VERSION)

    markdown = Redcarpet::Markdown.new(Redcarpet::Render::HTML)
    markdown.render(value)
  end

  private

  def demarked_value(value)
    markdown = Redcarpet::Markdown.new(Redcarpet::Render::StripDown)
    markdown.render(value)
  end
end
